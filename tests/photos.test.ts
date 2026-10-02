import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialMeeting } from '../src/live/model';
import { withVerifiedPhotos } from '../server/images';
import { isMeeting } from '../src/live/validation';
const meeting = initialMeeting();
const runner = meeting.races[0].runners[0];
const entry = {runnerId:runner.id,kind:'horse',identityName:runner.name,identityVerified:true,rightsConfirmed:true,url:'https://images.example/horse.jpg',sourceUrl:'https://club.example/horse',credit:'Club photographer',verifiedBy:'editor',verifiedAt:'2026-10-01T00:00:00Z'};
test('photos require explicit identity match and reuse permission; preserve race facts',()=>{
  const state = withVerifiedPhotos(meeting,JSON.stringify([entry]));
  assert.equal(state.races[0].runners[0].horsePhoto?.url,entry.url);
  assert.equal(isMeeting(state),true);assert.equal(meeting.races[0].runners[0].horsePhoto,undefined);
  for(const bad of [{...entry,identityName:'Different horse'},{...entry,rightsConfirmed:false},{...entry,identityVerified:false},{...entry,url:'javascript:alert(1)'},{...entry,verifiedAt:'not a date'}]) assert.equal(withVerifiedPhotos(meeting,JSON.stringify([bad])).races[0].runners[0].horsePhoto,undefined);
  assert.equal(withVerifiedPhotos(meeting,JSON.stringify([entry,entry])).races[0].runners[0].horsePhoto,undefined);
});
test('jockey photos are invalidated when the assigned jockey changes',()=>{
  const photo={...entry,kind:'jockey',identityName:runner.jockey};
  const raw=JSON.stringify([photo]);assert.ok(withVerifiedPhotos(meeting,raw).races[0].runners[0].jockeyPhoto);
  const changed=structuredClone(meeting);changed.races[0].runners[0].jockey='Different jockey';
  assert.equal(withVerifiedPhotos(changed,raw).races[0].runners[0].jockeyPhoto,undefined);
});
test('malformed photo registry never breaks meeting delivery',()=>{
  for(const raw of ['{','null','{}','[null]']) assert.equal(isMeeting(withVerifiedPhotos(meeting,raw)),true);
});

// RETIRED. The legacy Nomination entity no longer accepts new records.
// All nominations flow through NominationIntake via the /nominate hub.
export default async function(req) {
  return Response.json(
    { error: 'This nomination endpoint is retired. Submit nominations through /nominate.', redirect: '/nominate' },
    { status: 410 }
  );
}
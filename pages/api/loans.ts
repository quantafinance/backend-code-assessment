import type { NextApiRequest, NextApiResponse } from 'next'

import camelcaseKeys from 'camelcase-keys'

import { getClient } from 'src/database'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const client = getClient()
  try {
    const { page, pageSize } = _req.query
    const offset = Number(pageSize) * Number(page)
    await client.connect()

    const recordCount = await client.query(`
      select count(*) from loan t1
      left join address t2
          on t1.address_id = t2.id
      left join company t3
          on t1.company_id = t3.id
    `)

    const result = await client.query(`
      select
          t1.*,
          t2.address_1,
          t2.city,
          t2.state,
          t2.zip_code,
          t3.name as company_name
      from loan t1
      left join address t2
          on t1.address_id = t2.id
      left join company t3
          on t1.company_id = t3.id
      order by id
      limit ${pageSize} offset ${offset}
    `)

    res.status(200).json([camelcaseKeys(result.rows), recordCount.rows[0].count, pageSize, offset])
  } catch (err: any) {
      console.log(err)
    res.status(500).send(err.message)
  } finally {
    await client.end()
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'

import camelcaseKeys from 'camelcase-keys'

import { getClient } from 'src/database'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const client = getClient()
  console.log('req', _req.query)
  try {
    const { page, pageSize } = _req.query

    await client.connect()
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
        limit ${pageSize} offset ${page}
        `)

    res.status(200).json([camelcaseKeys(result.rows), result.rowCount])
  } catch (err: any) {
      console.log(err)
    res.status(500).send(err.message)
  } finally {
    await client.end()
  }
}

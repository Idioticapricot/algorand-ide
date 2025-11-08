import { NextRequest, NextResponse } from 'next/server'

const COMPILER_API_URL = process.env.NEXT_PUBLIC_COMPILER_API_URL || 'https://compiler.algocraft.fun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...payload } = body

    let endpoint = ''
    let requestBody = {}

    switch (type) {
      case 'puyapy':
      case 'pyteal':
        endpoint = '/compile-puyapy'
        requestBody = { code: payload.code }
        break
      case 'puyats':
        endpoint = '/compile-puyats'
        requestBody = { filename: payload.filename, code: payload.code }
        break
      case 'tealscript':
        endpoint = '/compile-tealscript'
        requestBody = { filename: payload.filename, code: payload.code }
        break
      case 'generate-client':
        endpoint = '/generate-client'
        requestBody = { arc32Json: payload.arc32Json }
        break
      default:
        return NextResponse.json({ error: 'Invalid compilation type' }, { status: 400 })
    }

    console.log(`[COMPILER] ${type.toUpperCase()} - Endpoint: ${COMPILER_API_URL}${endpoint}`)
    console.log(`[COMPILER] Request payload:`, requestBody)

    const response = await fetch(`${COMPILER_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`[COMPILER] Response status: ${response.status}`)

    if (type === 'tealscript') {
      const result = await response.text()
      console.log(`[COMPILER] TealScript response:`, result.substring(0, 200) + '...')
      return NextResponse.json({ ok: response.ok, result })
    } else {
      const result = await response.json()
      console.log(`[COMPILER] JSON response:`, result)
      return NextResponse.json(result)
    }
  } catch (error: any) {
    console.error('[COMPILER] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
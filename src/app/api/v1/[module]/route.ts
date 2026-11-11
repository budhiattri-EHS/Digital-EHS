// ==============================================================================
// UNIVERSAL REST API ROUTE HANDLER FOR WEB, IOS, & ANDROID
// Endpoint: /api/v1/[module]
// Supports Multi-Tenant company_id query parameter and token headers
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { UniversalEhsApi } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { module } = await params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id') || '00000000-0000-0000-0000-000000000001';

    let data: any = [];
    switch (module.toLowerCase()) {
      case 'telemetry':
        data = UniversalEhsApi.getTelemetry(companyId);
        break;
      case 'ptw':
      case 'permits':
        data = UniversalEhsApi.getPtwPermits(companyId);
        break;
      case '5s':
      case 'fives':
        data = UniversalEhsApi.getFiveSAudits(companyId);
        break;
      case 'fps':
      case 'fire-protection':
        data = UniversalEhsApi.getFpsAssets(companyId);
        break;
      case 'kaizen':
        data = UniversalEhsApi.getKaizenProposals(companyId);
        break;
      case 'uac':
      case 'observations':
        data = UniversalEhsApi.getSafetyObservations(companyId);
        break;
      case 'lms':
      case 'courses':
        data = UniversalEhsApi.getLmsCourses(companyId);
        break;
      case 'equipment':
      case 'machines':
        data = UniversalEhsApi.getEquipment(companyId);
        break;
      case 'statutory':
      case 'compliance':
        data = UniversalEhsApi.getStatutoryCompliances(companyId);
        break;
      case 'capa':
        data = UniversalEhsApi.getCapaActions(companyId);
        break;
      case 'moc':
        data = UniversalEhsApi.getMocRecords(companyId);
        break;
      case 'pssr':
        data = UniversalEhsApi.getPssrReviews(companyId);
        break;
      case 'hazop':
        data = UniversalEhsApi.getHazopStudies(companyId);
        break;
      case 'esg':
        data = UniversalEhsApi.getEsgMetrics(companyId);
        break;
      case 'drills':
        data = UniversalEhsApi.getMockDrills(companyId);
        break;
      case 'ohc':
        data = UniversalEhsApi.getOhcRecords(companyId);
        break;
      default:
        return NextResponse.json({ error: `Module '${module}' not recognized` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tenant_id: companyId,
      module: module,
      count: Array.isArray(data) ? data.length : 1,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ module: string }> }
) {
  try {
    const { module } = await params;
    const body = await request.json();
    const companyId = body.company_id || '00000000-0000-0000-0000-000000000001';

    let tableName = 'ehs_documents';
    if (module === 'ptw') tableName = 'ptw_permits';
    else if (module === '5s') tableName = 'five_s_audits';
    else if (module === 'fps') tableName = 'fps_assets';
    else if (module === 'kaizen') tableName = 'kaizen_proposals';
    else if (module === 'uac') tableName = 'safety_observations';
    else if (module === 'capa') tableName = 'capa_actions';
    else if (module === 'moc') tableName = 'moc_records';

    const saved = UniversalEhsApi.createRecord(tableName, { ...body, company_id: companyId });

    return NextResponse.json({
      success: true,
      module: module,
      record: saved,
      message: `Record logged successfully to multi-tenant ${tableName}`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { useState } from 'react';
import { DataGrid, type IDataGridColumn } from 'nexus-shell';

interface Deployment {
  id: string;
  service: string;
  env: string;
  status: 'healthy' | 'degraded' | 'failed';
  latency: number;
  version: string;
}

const ROWS: Deployment[] = [
  { id: '1', service: 'api-gateway', env: 'prod', status: 'healthy', latency: 42, version: '2.14.0' },
  { id: '2', service: 'auth-service', env: 'prod', status: 'healthy', latency: 18, version: '1.9.3' },
  { id: '3', service: 'search-index', env: 'prod', status: 'degraded', latency: 310, version: '0.8.1' },
  { id: '4', service: 'billing', env: 'staging', status: 'failed', latency: 0, version: '3.0.0-rc1' },
  { id: '5', service: 'notifications', env: 'staging', status: 'healthy', latency: 67, version: '1.2.7' },
  { id: '6', service: 'media-encoder', env: 'prod', status: 'healthy', latency: 128, version: '4.5.2' },
];

const STATUS_COLOR: Record<Deployment['status'], string> = {
  healthy: 'text-green-500',
  degraded: 'text-yellow-500',
  failed: 'text-red-500',
};

// #region basic
export const Basic = () => {
  const [selected, setSelected] = useState<string>();

  const columns: IDataGridColumn<Deployment>[] = [
    { key: 'service', header: 'Service', sortable: true },
    { key: 'env', header: 'Environment', width: 130 },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      sortable: true,
      // `render` receives the cell value and the whole row.
      render: (value: Deployment['status']) => (
        <span className={`font-semibold ${STATUS_COLOR[value]}`}>{value}</span>
      ),
    },
    {
      key: 'latency',
      header: 'p95',
      width: 100,
      sortable: true,
      render: (value: number) => <span className="font-mono">{value} ms</span>,
    },
    { key: 'version', header: 'Version', width: 120 },
  ];

  return (
    <DataGrid
      columns={columns}
      data={ROWS}
      selectedRowId={selected}
      onRowClick={(row) => setSelected(row.id)}
    />
  );
};
// #endregion

// #region noFilter
export const ServerSide = () => {
  const columns: IDataGridColumn<Deployment>[] = [
    { key: 'service', header: 'Service' },
    { key: 'status', header: 'Status', width: 120 },
    { key: 'version', header: 'Version', width: 120 },
  ];

  return (
    <DataGrid
      columns={columns}
      data={ROWS.slice(0, 3)}
      // Filtering upstream? Turn off the built-in box so there aren't two.
      showFilter={false}
      virtualized={false}
    />
  );
};
// #endregion

// #region loading
export const Loading = () => (
  <DataGrid
    columns={[
      { key: 'service', header: 'Service' },
      { key: 'status', header: 'Status' },
    ]}
    data={[]}
    loading
    placeholder="Fetching deployments…"
  />
);
// #endregion

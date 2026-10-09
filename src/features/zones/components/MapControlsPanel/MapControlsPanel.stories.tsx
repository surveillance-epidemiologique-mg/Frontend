import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MapControlsPanel } from './MapControlsPanel';

const meta = {
  title: 'Components/map-controls-panel',
  component: MapControlsPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof MapControlsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  layers: { regions: true, cas: false, centres: false, limites: false, clusters: false },
  statuts: new Set<string>(),
  maladie: "",
  maladieOptions: [],
  loading: false,
  onToggleLayer: () => {},
  onToggleStatut: () => {},
  onSetMaladie: () => {},
};

export const Default: Story = {
  args: { ...baseArgs, canViewCaseLayers: true },
};

export const RegionalAlertsOnly: Story = {
  args: { ...baseArgs, canViewCaseLayers: false },
};


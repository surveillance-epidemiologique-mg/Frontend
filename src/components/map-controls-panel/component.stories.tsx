import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MapControlsPanel } from './component';

const meta = {
  title: 'Components/map-controls-panel',
  component: MapControlsPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof MapControlsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

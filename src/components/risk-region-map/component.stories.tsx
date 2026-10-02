import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RiskRegionMap } from './component';

const meta = {
  title: 'Components/risk-region-map',
  component: RiskRegionMap,
  tags: ['autodocs'],
} satisfies Meta<typeof RiskRegionMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

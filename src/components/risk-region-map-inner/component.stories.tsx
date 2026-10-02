import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RiskRegionMapInner } from './component';

const meta = {
  title: 'Components/risk-region-map-inner',
  component: RiskRegionMapInner,
  tags: ['autodocs'],
} satisfies Meta<typeof RiskRegionMapInner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

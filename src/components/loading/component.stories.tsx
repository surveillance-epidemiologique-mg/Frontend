import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import DashboardLoading from './component';

const meta = {
  title: 'Components/loading',
  component: DashboardLoading,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

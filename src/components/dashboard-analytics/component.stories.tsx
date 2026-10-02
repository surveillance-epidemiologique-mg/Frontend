import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DashboardAnalytics } from './component';

const meta = {
  title: 'Components/dashboard-analytics',
  component: DashboardAnalytics,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

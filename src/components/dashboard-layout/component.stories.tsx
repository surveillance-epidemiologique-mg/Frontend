import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DashboardLayout } from './component';

const meta = {
  title: 'Components/dashboard-layout',
  component: DashboardLayout,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

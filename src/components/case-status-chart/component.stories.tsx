import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CaseStatusChart from './component';

const meta = {
  title: 'Components/case-status-chart',
  component: CaseStatusChart,
  tags: ['autodocs'],
} satisfies Meta<typeof CaseStatusChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

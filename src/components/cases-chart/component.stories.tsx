import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import CasesChart from './component';

const meta = {
  title: 'Components/cases-chart',
  component: CasesChart,
  tags: ['autodocs'],
} satisfies Meta<typeof CasesChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

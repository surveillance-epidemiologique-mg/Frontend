import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConfirmedTrendChart } from './component';

const meta = {
  title: 'Components/charts',
  component: ConfirmedTrendChart,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmedTrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

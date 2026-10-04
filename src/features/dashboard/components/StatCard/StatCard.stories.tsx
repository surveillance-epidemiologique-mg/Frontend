import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatCard } from './StatCard';

const meta = {
  title: 'Components/stat-card',
  component: StatCard,
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };


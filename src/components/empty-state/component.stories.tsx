import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EmptyState } from './component';

const meta = {
  title: 'Components/empty-state',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

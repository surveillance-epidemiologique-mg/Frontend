import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RouteProgress } from './component';

const meta = {
  title: 'Components/route-progress',
  component: RouteProgress,
  tags: ['autodocs'],
} satisfies Meta<typeof RouteProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

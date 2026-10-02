import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Skeleton } from './component';

const meta = {
  title: 'Components/skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

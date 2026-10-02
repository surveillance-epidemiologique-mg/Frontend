import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Spinner } from './component';

const meta = {
  title: 'Components/spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

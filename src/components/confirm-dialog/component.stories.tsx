import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConfirmDialog } from './component';

const meta = {
  title: 'Components/confirm-dialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

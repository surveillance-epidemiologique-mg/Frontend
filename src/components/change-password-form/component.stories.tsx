import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChangePasswordForm } from './component';

const meta = {
  title: 'Components/change-password-form',
  component: ChangePasswordForm,
  tags: ['autodocs'],
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

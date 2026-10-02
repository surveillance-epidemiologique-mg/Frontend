import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ResetPasswordForm } from './component';

const meta = {
  title: 'Components/reset-password-form',
  component: ResetPasswordForm,
  tags: ['autodocs'],
} satisfies Meta<typeof ResetPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

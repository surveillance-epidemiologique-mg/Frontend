import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ForgotPasswordForm } from './component';

const meta = {
  title: 'Components/forgot-password-form',
  component: ForgotPasswordForm,
  tags: ['autodocs'],
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

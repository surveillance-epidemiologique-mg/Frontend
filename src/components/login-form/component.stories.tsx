import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LoginForm } from './component';

const meta = {
  title: 'Components/login-form',
  component: LoginForm,
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

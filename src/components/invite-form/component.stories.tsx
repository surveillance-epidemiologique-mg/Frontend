import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { InviteForm } from './component';

const meta = {
  title: 'Components/invite-form',
  component: InviteForm,
  tags: ['autodocs'],
} satisfies Meta<typeof InviteForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { UserFormModal } from './UserFormModal';

const meta = {
  title: 'Components/user-form-modal',
  component: UserFormModal,
  tags: ['autodocs'],
} satisfies Meta<typeof UserFormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };


import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MaladieFormModal } from './MaladieFormModal';

const meta = {
  title: 'Components/maladie-form-modal',
  component: MaladieFormModal,
  tags: ['autodocs'],
} satisfies Meta<typeof MaladieFormModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} as any };


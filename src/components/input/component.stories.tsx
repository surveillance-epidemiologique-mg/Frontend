import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from './component';

const meta = {
  title: 'Components/input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: 'Nom du patient', placeholder: 'Saisir un nom', hint: 'Nom complet du patient' } };

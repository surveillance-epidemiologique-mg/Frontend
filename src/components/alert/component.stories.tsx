import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert } from './component';

const meta = {
  title: 'Components/alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: 'info', title: 'Information', children: 'Les données de surveillance ont été actualisées.' } };

export const Variants: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert variant="success" title="Enregistré">Le cas a été ajouté au registre.</Alert>
      <Alert variant="warning" title="À vérifier">Certaines informations sont manquantes.</Alert>
      <Alert variant="error" title="Échec">La synchronisation a échoué.</Alert>
    </div>
  ),
};

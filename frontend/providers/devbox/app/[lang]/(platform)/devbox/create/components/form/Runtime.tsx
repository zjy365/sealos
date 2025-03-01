import TemplateRepositorySelector from './components/TemplateRepositorySelector';
import TemplateSelector from './components/TemplateSelector';

export default function Runtime({ isEdit }: { isEdit: boolean }) {
  return (
    <>
      <TemplateRepositorySelector isEdit={isEdit} />
      <TemplateSelector isEdit={isEdit} />
    </>
  );
}

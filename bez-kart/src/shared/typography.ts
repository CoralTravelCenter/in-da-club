import Typograf from 'typograf';

const typograf = new Typograf({
  locale: ['ru', 'en-US'],
});

export function typographText(text: string): string {
  return typograf.execute(text);
}

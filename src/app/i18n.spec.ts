import { detectLang } from './i18n';

describe('detectLang', () => {
  it('uses Portuguese for any Portuguese browser', () => {
    expect(detectLang(['pt-PT', 'en'])).toBe('pt');
    expect(detectLang(['pt-BR'])).toBe('pt');
    expect(detectLang(['PT'])).toBe('pt');
  });

  it('uses English for every other language', () => {
    expect(detectLang(['en-US', 'pt-PT'])).toBe('en');
    expect(detectLang(['es-ES'])).toBe('en');
    expect(detectLang(['pth'])).toBe('en');
    expect(detectLang([])).toBe('en');
  });
});

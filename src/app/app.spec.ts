import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('shows the empty state when there are no streams', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty h2')?.textContent).toContain('Nenhum direto');
  });

  it('explains why an unknown link was rejected', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input')!;
    input.value = 'https://vimeo.com/123';
    compiled.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(compiled.querySelector('.error')?.textContent).toContain('Não reconheço');
  });

  it('links to a prefilled bug report on GitHub', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector<HTMLAnchorElement>('a[title="Reportar um erro"]')!;
    const url = new URL(link.href);
    expect(url.pathname).toBe('/joaooliveira97/mission-control-center/issues/new');
    expect(url.searchParams.get('template')).toBe('bug_report.yml');
    expect(url.searchParams.get('browser')).toBe(navigator.userAgent);
  });
});

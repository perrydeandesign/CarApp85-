// affiliate imports the product catalog, which transitively pulls in
// react-native-vector-icons (untransformed by jest) via mockData. Stub the icon
// modules so this pure-logic test doesn't need the native RN chain.
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

import { isSpecificProductUrl, decorateUrl, resolveBuyUrl } from '../affiliate';
import type { VProduct } from '../../constants/types';

function product(overrides: Partial<VProduct> = {}): VProduct {
  return {
    name: 'Test Part',
    compat: 'WRX 2022-2026',
    price: 100,
    was: null,
    badge: null,
    cat: 'intake',
    color: '#000',
    vendorId: 3,
    desc: 'desc',
    ...overrides,
  };
}

describe('isSpecificProductUrl', () => {
  it('accepts product / model pages', () => {
    expect(isSpecificProductUrl('https://www.cobbtuning.com/products/accessport/x')).toBe(true);
    expect(isSpecificProductUrl('https://smyperformance.com/cusco-strut.html')).toBe(true);
    expect(isSpecificProductUrl('https://enkei.com/shop/wheels/racing/rpf1/')).toBe(true);
    expect(isSpecificProductUrl('https://www.recaro-automotive.com/us/dynamic/recaro-sportster-cs')).toBe(true);
    expect(isSpecificProductUrl('https://varisna.com/subaru/varis-widebody-kit')).toBe(true);
  });

  it('rejects homepages, collections, and category landings', () => {
    expect(isSpecificProductUrl('https://www.mishimoto.com')).toBe(false);
    expect(isSpecificProductUrl('https://perrin.com/collections/wrx')).toBe(false);
    expect(isSpecificProductUrl('https://varisna.com/subaru/')).toBe(false);
    expect(isSpecificProductUrl('https://www.hks-power.co.jp/en/')).toBe(false);
    expect(isSpecificProductUrl(null)).toBe(false);
    expect(isSpecificProductUrl(undefined)).toBe(false);
  });
});

describe('decorateUrl', () => {
  it('appends UTM params to a bare URL', () => {
    expect(decorateUrl('https://x.com/p', 3, 'buy')).toBe(
      'https://x.com/p?utm_source=modified&utm_medium=buy&utm_campaign=vendor',
    );
  });

  it('uses & when a query already exists and preserves the #fragment', () => {
    expect(decorateUrl('https://x.com/p?sku=1#tab', 3, 'buy')).toBe(
      'https://x.com/p?sku=1&utm_source=modified&utm_medium=buy&utm_campaign=vendor#tab',
    );
  });

  it('does not clobber a param the URL already carries', () => {
    expect(decorateUrl('https://x.com/p?utm_source=other', 3, 'buy')).toBe(
      'https://x.com/p?utm_source=other&utm_medium=buy&utm_campaign=vendor',
    );
  });

  it('leaves non-web links and empty values untouched', () => {
    expect(decorateUrl('mailto:a@b.com', 3)).toBe('mailto:a@b.com');
    expect(decorateUrl(null)).toBeNull();
  });
});

describe('resolveBuyUrl', () => {
  it('keeps a real product URL', () => {
    const url = resolveBuyUrl(product({ productURL: 'https://www.cobbtuning.com/products/accessport/x' }));
    expect(url).toContain('/products/accessport/x');
    expect(url).toContain('utm_source=modified');
  });

  it('falls back to a SubiSpeed product search for a stocked (Subaru) brand', () => {
    const url = resolveBuyUrl(product({ vendorId: 16, name: 'DeatschWerks DW400', productURL: 'https://www.deatschwerks.com' }));
    expect(url).toContain('subispeed.com/search');
    expect(url).toContain(encodeURIComponent('DeatschWerks DW400'));
  });

  it('falls back to a web search for a non-SubiSpeed brand', () => {
    const url = resolveBuyUrl(product({ vendorId: 4, name: 'Recaro Profi SPG', productURL: 'https://www.recaro-automotive.com/us/motorsport/' }));
    expect(url).toContain('google.com/search');
    expect(url).toContain(encodeURIComponent('Recaro Profi SPG'));
  });

  it('never returns a bare homepage', () => {
    const url = resolveBuyUrl(product({ vendorId: 9, name: 'Mishimoto FMIC', productURL: 'https://www.mishimoto.com' }));
    expect(url).not.toBe('https://www.mishimoto.com');
    expect(url).toContain('/search');
  });
});

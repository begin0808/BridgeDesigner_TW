/* Copyright (c) 2025-2026 Gene Ressler
   SPDX-License-Identifier: GPL-3.0-or-later */

import { Injectable } from '@angular/core';
import { HELP_INDEX_DATA } from './index-data';
import { create, search, insertMultiple, Results, TypedDocument, Orama, SearchParams, Tokenizer } from '@orama/orama';

export type HelpTopic = TypedDocument<Orama<typeof HELP_SCHEMA>>;

const HELP_SCHEMA = {
  id: 'string',
  title: 'string',
  text: 'string',
} as const;

const TITLE_PREFIX_RE = /^(?:title|標題)\s*[:：]\s*/i;

/** Custom tokenizer supporting Traditional Chinese (unigrams + bigrams), fullwidth NFKC normalization, and English/alphanumeric terms. */
function tokenizeCjk(raw: string): string[] {
  if (typeof raw !== 'string') {
    return [String(raw)];
  }
  const tokens: string[] = [];
  const normalized = raw.normalize('NFKC').toLowerCase();
  const asciiWords = normalized.match(/[a-z0-9_]+/g);
  if (asciiWords) {
    tokens.push(...asciiWords);
  }
  const cjkRuns = normalized.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g);
  if (cjkRuns) {
    for (const run of cjkRuns) {
      for (let i = 0; i < run.length; i++) {
        tokens.push(run[i]);
        if (i + 1 < run.length) {
          tokens.push(run.slice(i, i + 2));
        }
      }
    }
  }
  return tokens;
}

const CJK_TOKENIZER: Tokenizer = {
  language: 'english',
  normalizationCache: new Map(),
  tokenize: tokenizeCjk,
};

@Injectable({ providedIn: 'root' })
export class HelpIndexService {
  private readonly helpDb: Orama<typeof HELP_SCHEMA>;

  constructor() {
    this.helpDb = create({
      schema: HELP_SCHEMA,
      components: {
        tokenizer: CJK_TOKENIZER,
      },
    });
    insertMultiple(this.helpDb, HELP_INDEX_DATA, 300);
  }

  public search(rawTerm: string): Results<HelpTopic> {
    let term = rawTerm.normalize('NFKC').trim();
    let properties: ('title' | 'text')[] = ['title', 'text'];
    const prefixMatch = term.match(TITLE_PREFIX_RE);
    if (prefixMatch) {
      term = term.slice(prefixMatch[0].length).trim();
      properties = ['title'];
    }
    if (!term) {
      return {
        elapsed: { raw: 0, formatted: '0ns' },
        hits: [],
        count: 0,
      };
    }
    const searchParams: SearchParams<Orama<typeof HELP_SCHEMA>> = {
      term,
      properties,
      boost: { title: 3 },
      limit: 100,
    };
    return search(this.helpDb, searchParams) as Results<HelpTopic>; // Ignore Promise<> alternate.
  }
}

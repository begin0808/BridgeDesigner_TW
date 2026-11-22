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

/** Custom tokenizer supporting both Traditional Chinese (unigrams + bigrams) and English/alphanumeric terms. */
function tokenizeCjk(raw: string): string[] {
  if (typeof raw !== 'string') {
    return [String(raw)];
  }
  const tokens: string[] = [];
  const lower = raw.toLowerCase();
  const asciiWords = lower.match(/[a-z0-9_]+/g);
  if (asciiWords) {
    tokens.push(...asciiWords);
  }
  const cjkRuns = lower.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g);
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

  public search(term: string): Results<HelpTopic> {
    let properties: 'title'[] | '*' = '*';
    if (term.startsWith('title:')) {
      term = term.slice(6);
      properties = ['title'];
    } else if (term.startsWith('標題:') || term.startsWith('標題：')) {
      term = term.slice(3);
      properties = ['title'];
    }
    const searchParams: SearchParams<Orama<typeof HELP_SCHEMA>> = {
      term: term.trim(),
      properties,
      boost: { title: 3 },
      limit: 100,
    };
    return search(this.helpDb, searchParams) as Results<HelpTopic>; // Ignore Promise<> alternate.
  }
}

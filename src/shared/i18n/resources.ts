export const resources = {
  en: {
    translation: {
      appTitle: 'Coduck - CP Editorial',
      common: {
        loading: 'Loading editorial index...',
      },
      nav: {
        home: 'Home',
        search: 'Search',
        categories: 'Categories',
        contribute: 'Upload Guide',
        copyright: 'Copyright',
      },
      footer: {
        description: 'A curated archive for competitive-programming contest editorials.',
        dataSource: 'Data source:',
        explore: {
          heading: 'Explore',
          search: 'Find Competitions',
          categories: 'Browse Categories',
          contribute: 'Upload Guide',
          copyright: 'Copyright Policy',
        },
        links: {
          heading: 'Repositories',
          dataRepo: 'cp-editorial-data',
          frontendRepo: 'cp-editorial-frontend',
        },
        community: {
          heading: 'Community',
          issues: 'Report an issue',
          discussions: 'Discussions',
        },
        site: 'editorial.coduck.io',
        copyright: '© {{year}} Coduck',
      },
      home: {
        heading: 'Find Contest Editorials',
        description: 'Search competitions and quickly open or download editorials by keyword.',
        stats: {
          editorials: 'Editorials',
          contests: 'Competitions',
          indexVersion: 'Index Version',
        },
        article: {
          heading: 'What is CP Editorial?',
          body1:
            'CP Editorial is a curated archive for competitive-programming contest editorials.',
          body2:
            'It helps you find contest write-ups quickly and access original editorial files from <repo>cp-editorial-data</repo>.',
          point1: 'Browse by category and contest hierarchy.',
          point2: 'Search by contest name, year, or editorial title.',
          point3: 'Open or download editorial source files directly.',
        },
      },
      search: {
        heading: 'Find Competitions',
        description:
          'Use contest names or related keywords to find a competition and access its editorials.',
        label: 'Keyword',
        placeholder: 'Search by competition name, year, or editorial title...',
        contestCount_one: '{{count}} competition found',
        contestCount_other: '{{count}} competitions found',
        editorialCount_one: '{{count}} editorial',
        editorialCount_other: '{{count}} editorials',
        view: 'View',
        download: 'Download',
        empty: 'No competitions match your search.',
      },
      categories: {
        heading: 'Browse by Category',
        empty: 'No categories are available yet.',
        count_one: '{{count}} editorial',
        count_other: '{{count}} editorials',
      },
      category: {
        heading: 'Category: {{category}}',
        unknown: 'Unknown',
        empty: 'No contests are available in this category.',
        editorialCount_one: '{{count}} editorial',
        editorialCount_other: '{{count}} editorials',
      },
      contest: {
        heading: 'Contest: {{contest}}',
        unknown: 'Unknown',
        category: 'Category: {{category}}',
        empty: 'No editorials are available in this contest.',
        editorialCount_one: '{{count}} editorial',
        editorialCount_other: '{{count}} editorials',
      },
      editorial: {
        contest: 'Contest',
        category: 'Category',
        problem: 'Entry',
        path: 'Path',
        filename: 'Filename',
        view: 'View',
        download: 'Download',
        viewAria: 'View editorial: {{title}}',
        downloadAria: 'Download editorial: {{title}}',
        notFound: 'Editorial not found.',
      },
      contribute: {
        heading: 'How to Upload Editorial Data',
        description:
          'Editorial data is managed in the <repo>cp-editorial-data</repo> repository. Follow this detailed guide to add files safely and keep indexing stable.',
        structure: {
          heading: '1) Folder structure and file placement',
          description:
            'Use the hierarchy `Category / Contest(or Organization) / Editorial file` so the site can map category, contest, and entry title correctly.',
          example:
            'Open Cup/XXI Open Cup named after E.V. Pankratiev/Stage 14 - Grand Prix of Tokyo.pdf',
          rule1: 'The first folder is the category (example: University, Olympiad, Open Cup).',
          rule2: 'The second folder is the contest or organization name.',
          rule3:
            'The file name becomes the editorial entry title shown in search and contest pages.',
        },
        workflow: {
          heading: '2) Recommended Git workflow',
          step1: 'Create a branch in `cp-editorial-data`.',
          step2: 'Add editorial files in the correct folder path.',
          step3: 'Use clear names (English or Korean are both supported).',
          step4: 'Commit with a descriptive message and push the branch.',
          step5: 'Open a pull request and request review.',
          step6:
            'After merge to `main`, index generation and frontend deployment run automatically.',
        },
        checklist: {
          heading: '3) Pre-PR checklist',
          item1: 'File opens correctly and is not corrupted.',
          item2: 'Path follows `Category/Contest/File` hierarchy.',
          item3: 'No accidental docs or unrelated files are included.',
          item4: 'Title/year wording in filename is accurate and final.',
        },
        footer:
          'If deployment did not refresh data, check the cross-repo dispatch workflow and static index artifact version.',
      },
      copyrightPage: {
        heading: 'Editorial Copyright & Usage',
        description:
          'This page explains ownership, attribution, and usage expectations for editorial content listed in CP Editorial.',
        ownership: {
          heading: 'Ownership',
          body: 'Editorial files listed here remain the property of their original authors or rights holders. CP Editorial only indexes and links files managed in <dataRepo>cp-editorial-data</dataRepo>.',
        },
        attribution: {
          heading: 'Attribution expectations',
          item1:
            'When sharing or quoting editorial content, preserve original author, contest, and source information.',
          item2: 'Include a clear reference to the original source repository or publication.',
          item3: 'Do not remove existing credit, watermark, or license notices from files.',
        },
        usage: {
          heading: 'Permitted use',
          body: 'Use this archive for learning and reference. Redistribution or republication should follow each source author or organization policy.',
        },
        removal: {
          heading: 'Contact and removal requests',
          body: 'If you are a rights holder and need a correction, attribution update, or removal, open an issue in <issues>Issues in utilForever/cp-editorial-data</issues> with the file path and request details.',
        },
      },
      language: {
        label: 'Language',
      },
    },
  },
  ko: {
    translation: {
      appTitle: 'Coduck - CP Editorial',
      common: {
        loading: '에디토리얼 인덱스를 불러오는 중입니다...',
      },
      nav: {
        home: '홈',
        search: '검색',
        categories: '카테고리',
        contribute: '업로드 가이드',
        copyright: '저작권',
      },
      footer: {
        description: '경쟁 프로그래밍 대회 에디토리얼을 모아 둔 아카이브입니다.',
        dataSource: '데이터 소스:',
        explore: {
          heading: '탐색',
          search: '대회 찾기',
          categories: '카테고리 보기',
          contribute: '업로드 가이드',
          copyright: '저작권 안내',
        },
        links: {
          heading: '저장소',
          dataRepo: 'cp-editorial-data',
          frontendRepo: 'cp-editorial-frontend',
        },
        community: {
          heading: '커뮤니티',
          issues: '이슈 제보',
          discussions: '토론',
        },
        site: 'editorial.coduck.io',
        copyright: '© {{year}} Coduck',
      },
      home: {
        heading: '대회 에디토리얼 찾기',
        description:
          '대회 이름 키워드로 원하는 대회를 찾아 해설을 열람하거나 다운로드할 수 있습니다.',
        stats: {
          editorials: '에디토리얼 수',
          contests: '대회 수',
          indexVersion: '인덱스 버전',
        },
        article: {
          heading: 'CP Editorial이란?',
          body1: 'CP Editorial은 알고리즘 대회의 에디토리얼을 모아두는 아카이브 서비스입니다.',
          body2:
            '원하는 대회 해설을 빠르게 찾고 <repo>cp-editorial-data</repo>의 원본 파일에 바로 접근할 수 있습니다.',
          point1: '카테고리와 대회 계층으로 탐색할 수 있습니다.',
          point2: '대회명, 연도, 해설 제목으로 검색할 수 있습니다.',
          point3: '해설 파일을 바로 열거나 다운로드할 수 있습니다.',
        },
      },
      search: {
        heading: '대회 찾기',
        description: '대회명 또는 관련 키워드로 대회를 찾고 해설을 바로 열람/다운로드하세요.',
        label: '키워드',
        placeholder: '대회명, 연도, 해설 제목으로 검색하세요...',
        contestCount_one: '{{count}}개 대회 검색됨',
        contestCount_other: '{{count}}개 대회 검색됨',
        editorialCount_one: '{{count}}개 해설',
        editorialCount_other: '{{count}}개 해설',
        view: '열기',
        download: '다운로드',
        empty: '일치하는 대회가 없습니다.',
      },
      categories: {
        heading: '카테고리별 보기',
        empty: '등록된 카테고리가 없습니다.',
        count_one: '{{count}}개 에디토리얼',
        count_other: '{{count}}개 에디토리얼',
      },
      category: {
        heading: '카테고리: {{category}}',
        unknown: '알 수 없음',
        empty: '해당 카테고리에 대회가 없습니다.',
        editorialCount_one: '{{count}}개 해설',
        editorialCount_other: '{{count}}개 해설',
      },
      contest: {
        heading: '대회: {{contest}}',
        unknown: '알 수 없음',
        category: '카테고리: {{category}}',
        empty: '해당 대회에 해설이 없습니다.',
        editorialCount_one: '{{count}}개 해설',
        editorialCount_other: '{{count}}개 해설',
      },
      editorial: {
        contest: '대회',
        category: '카테고리',
        problem: '항목',
        path: '경로',
        filename: '파일명',
        view: '열기',
        download: '다운로드',
        viewAria: '{{title}} 에디토리얼 열기',
        downloadAria: '{{title}} 에디토리얼 다운로드',
        notFound: '에디토리얼을 찾을 수 없습니다.',
      },
      contribute: {
        heading: '에디토리얼 데이터 업로드 방법',
        description:
          '에디토리얼 데이터는 <repo>cp-editorial-data</repo> 저장소에서 관리됩니다. 아래 상세 가이드를 따라 업로드하면 인덱싱이 안정적으로 동작합니다.',
        structure: {
          heading: '1) 폴더 구조와 파일 배치',
          description:
            '사이트가 카테고리/대회/항목을 정확히 인식하려면 `카테고리 / 대회(또는 기관) / 에디토리얼 파일` 구조를 지켜주세요.',
          example:
            'Open Cup/XXI Open Cup named after E.V. Pankratiev/Stage 14 - Grand Prix of Tokyo.pdf',
          rule1: '첫 번째 폴더는 카테고리입니다. (예: University, Olympiad, Open Cup)',
          rule2: '두 번째 폴더는 대회 또는 주관 기관명입니다.',
          rule3: '파일명은 검색/대회 페이지에 표시되는 에디토리얼 항목 제목이 됩니다.',
        },
        workflow: {
          heading: '2) 권장 Git 작업 흐름',
          step1: '`cp-editorial-data`에서 브랜치를 생성합니다.',
          step2: '올바른 경로에 에디토리얼 파일을 추가합니다.',
          step3: '파일명은 명확하게 작성합니다. (영문/한글 모두 가능)',
          step4: '의미 있는 커밋 메시지로 커밋 후 브랜치를 푸시합니다.',
          step5: 'Pull Request를 생성하고 리뷰를 요청합니다.',
          step6: '`main` 병합 후 인덱스 생성과 프론트엔드 배포가 자동 실행됩니다.',
        },
        checklist: {
          heading: '3) PR 전 체크리스트',
          item1: '파일이 정상적으로 열리고 손상되지 않았습니다.',
          item2: '경로가 `카테고리/대회/파일` 구조를 따릅니다.',
          item3: 'README 등 불필요한 파일이 포함되지 않았습니다.',
          item4: '파일명(대회명/연도)이 최종 표기와 일치합니다.',
        },
        footer:
          '데이터가 갱신되지 않으면 cross-repo dispatch 워크플로와 인덱스 아티팩트 버전을 확인하세요.',
      },
      copyrightPage: {
        heading: '에디토리얼 저작권 및 이용 안내',
        description:
          '이 페이지는 CP Editorial에 등록된 에디토리얼 콘텐츠의 소유권, 출처 표기, 이용 기준을 설명합니다.',
        ownership: {
          heading: '소유권',
          body: '이 사이트에 표시되는 에디토리얼 파일의 권리는 원저자 또는 권리자에게 있습니다. CP Editorial은 <dataRepo>cp-editorial-data</dataRepo>에서 관리되는 파일을 인덱싱하고 링크만 제공합니다.',
        },
        attribution: {
          heading: '출처 표기 원칙',
          item1: '에디토리얼 내용을 공유하거나 인용할 때 원저자, 대회명, 출처 정보를 유지하세요.',
          item2: '원본 저장소 또는 게시 위치를 명확히 함께 표기하세요.',
          item3: '파일에 포함된 저작권 고지, 워터마크, 라이선스 문구를 제거하지 마세요.',
        },
        usage: {
          heading: '이용 범위',
          body: '이 아카이브는 학습과 참고 용도로 사용하세요. 재배포 또는 재게시는 각 원저자/기관의 정책을 따라야 합니다.',
        },
        removal: {
          heading: '문의 및 삭제 요청',
          body: '권리자이며 정정, 출처 수정, 삭제가 필요한 경우 파일 경로와 요청 사유를 포함해 <issues>utilForever/cp-editorial-data의 Issues</issues>에 이슈를 등록해 주세요.',
        },
      },
      language: {
        label: '언어',
      },
    },
  },
  ja: {
    translation: {
      appTitle: 'Coduck - CP Editorial',
      common: {
        loading: 'エディトリアルインデックスを読み込み中...',
      },
      nav: {
        home: 'ホーム',
        search: '検索',
        categories: 'カテゴリ',
        contribute: 'アップロードガイド',
        copyright: '著作権',
      },
      footer: {
        description: '競技プログラミング大会のエディトリアルを集約したアーカイブです。',
        dataSource: 'データソース:',
        explore: {
          heading: '探索',
          search: '大会を探す',
          categories: 'カテゴリを見る',
          contribute: 'アップロードガイド',
          copyright: '著作権案内',
        },
        links: {
          heading: 'リポジトリ',
          dataRepo: 'cp-editorial-data',
          frontendRepo: 'cp-editorial-frontend',
        },
        community: {
          heading: 'コミュニティ',
          issues: 'Issue を報告',
          discussions: 'ディスカッション',
        },
        site: 'editorial.coduck.io',
        copyright: '© {{year}} Coduck',
      },
      home: {
        heading: '大会エディトリアルを探す',
        description:
          '大会名のキーワードで大会を見つけ、エディトリアルを表示・ダウンロードできます。',
        stats: {
          editorials: 'エディトリアル数',
          contests: '大会数',
          indexVersion: 'インデックス版',
        },
        article: {
          heading: 'CP Editorial とは？',
          body1:
            'CP Editorial は、競技プログラミング大会のエディトリアルをまとめたアーカイブです。',
          body2:
            '大会ごとの解説を素早く探し、<repo>cp-editorial-data</repo> の元ファイルに直接アクセスできます。',
          point1: 'カテゴリと大会の階層で閲覧できます。',
          point2: '大会名・開催年・解説タイトルで検索できます。',
          point3: '解説ファイルをそのまま表示またはダウンロードできます。',
        },
      },
      search: {
        heading: '大会を探す',
        description: '大会名や関連キーワードで大会を検索し、エディトリアルをすぐに参照できます。',
        label: 'キーワード',
        placeholder: '大会名、開催年、解説タイトルで検索...',
        contestCount_one: '{{count}} 件の大会',
        contestCount_other: '{{count}} 件の大会',
        editorialCount_one: '{{count}} 件のエディトリアル',
        editorialCount_other: '{{count}} 件のエディトリアル',
        view: '表示',
        download: 'ダウンロード',
        empty: '一致する大会がありません。',
      },
      categories: {
        heading: 'カテゴリ別に見る',
        empty: 'カテゴリはまだありません。',
        count_one: '{{count}} 件のエディトリアル',
        count_other: '{{count}} 件のエディトリアル',
      },
      category: {
        heading: 'カテゴリ: {{category}}',
        unknown: '不明',
        empty: 'このカテゴリに大会はありません。',
        editorialCount_one: '{{count}} 件のエディトリアル',
        editorialCount_other: '{{count}} 件のエディトリアル',
      },
      contest: {
        heading: '大会: {{contest}}',
        unknown: '不明',
        category: 'カテゴリ: {{category}}',
        empty: 'この大会にエディトリアルはありません。',
        editorialCount_one: '{{count}} 件のエディトリアル',
        editorialCount_other: '{{count}} 件のエディトリアル',
      },
      editorial: {
        contest: '大会',
        category: 'カテゴリ',
        problem: '項目',
        path: 'パス',
        filename: 'ファイル名',
        view: '表示',
        download: 'ダウンロード',
        viewAria: '{{title}} のエディトリアルを表示',
        downloadAria: '{{title}} のエディトリアルをダウンロード',
        notFound: 'エディトリアルが見つかりません。',
      },
      contribute: {
        heading: 'エディトリアルデータのアップロード方法',
        description:
          'エディトリアルデータは <repo>cp-editorial-data</repo> リポジトリで管理します。次の詳細ガイドに沿って追加すると、インデックスが正しく生成されます。',
        structure: {
          heading: '1) フォルダ構成と配置ルール',
          description:
            'サイトでカテゴリ・大会・項目を正しく解釈するため、`カテゴリ / 大会(または団体) / エディトリアルファイル` 構成を使用します。',
          example:
            'Open Cup/XXI Open Cup named after E.V. Pankratiev/Stage 14 - Grand Prix of Tokyo.pdf',
          rule1: '1階層目はカテゴリです（例: University, Olympiad, Open Cup）。',
          rule2: '2階層目は大会名または主催団体名です。',
          rule3: 'ファイル名は検索画面と大会画面で表示されるエディトリアル項目名になります。',
        },
        workflow: {
          heading: '2) 推奨 Git ワークフロー',
          step1: '`cp-editorial-data` で作業ブランチを作成します。',
          step2: '正しいパスにエディトリアルファイルを追加します。',
          step3: 'ファイル名は分かりやすく付けます（英語/韓国語対応）。',
          step4: '説明的なコミットメッセージでコミットし、push します。',
          step5: 'Pull Request を作成し、レビューを依頼します。',
          step6:
            '`main` にマージされると、インデックス生成とフロントエンド配信が自動実行されます。',
        },
        checklist: {
          heading: '3) PR 前チェックリスト',
          item1: 'ファイルが正常に開けて破損していない。',
          item2: 'パスが `カテゴリ/大会/ファイル` 構造になっている。',
          item3: 'README など不要なファイルを含めていない。',
          item4: 'ファイル名の大会名・年表記が最終版と一致している。',
        },
        footer:
          '更新が反映されない場合は、cross-repo dispatch ワークフローとインデックス成果物のバージョンを確認してください。',
      },
      copyrightPage: {
        heading: 'エディトリアルの著作権と利用方針',
        description:
          'このページでは、CP Editorial に掲載されるエディトリアルの権利帰属、出典表記、利用上の注意を説明します。',
        ownership: {
          heading: '権利帰属',
          body: '掲載されているエディトリアルファイルの権利は、元の著者または権利者に帰属します。CP Editorial は <dataRepo>cp-editorial-data</dataRepo> で管理されるファイルを索引化し、リンクのみを提供します。',
        },
        attribution: {
          heading: '出典表記の方針',
          item1:
            'エディトリアル内容を共有・引用する際は、著者名・大会名・出典情報を維持してください。',
          item2: '元のリポジトリまたは公開元への明確な参照を付けてください。',
          item3: '既存のクレジット、ウォーターマーク、ライセンス表記を削除しないでください。',
        },
        usage: {
          heading: '利用範囲',
          body: '本アーカイブは学習・参照目的で利用してください。再配布や再掲載は、各著者・団体の方針に従ってください。',
        },
        removal: {
          heading: '問い合わせ・削除依頼',
          body: '権利者として修正、出典更新、削除が必要な場合は、対象ファイルのパスと依頼内容を添えて <issues>utilForever/cp-editorial-data の Issues</issues> に issue を作成してください。',
        },
      },
      language: {
        label: '言語',
      },
    },
  },
}

export interface BlockPresentation {
    placement: {
        mobile: 'featured' | 'list';
        desktop: {column: string; row: string};
    };
    background?: {
        mobile: {src: string};
        desktop?: {src: string};
    };
}

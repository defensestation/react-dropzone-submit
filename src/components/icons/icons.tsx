import { cn } from '@/lib/utils';
import React from 'react';


type IconProps = {
  className: string;
}

export const EnvelopeIcon = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" className={cn("w-4 h-4", className)} {...rest}>
    <path
      d="M17.5 6h-16c-0.827 0-1.5 0.673-1.5 1.5v9c0 0.827 0.673 1.5 1.5 1.5h16c0.827 0 1.5-0.673 1.5-1.5v-9c0-0.827-0.673-1.5-1.5-1.5zM17.5 7c0.030 0 0.058 0.003 0.087 0.008l-7.532 5.021c-0.29 0.193-0.819 0.193-1.109 0l-7.532-5.021c0.028-0.005 0.057-0.008 0.087-0.008h16zM17.5 17h-16c-0.276 0-0.5-0.224-0.5-0.5v-8.566l7.391 4.927c0.311 0.207 0.71 0.311 1.109 0.311s0.798-0.104 1.109-0.311l7.391-4.927v8.566c0 0.276-0.224 0.5-0.5 0.5z"
      fill="currentColor"
    />
  </svg>
);


export const LogoIcon = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 74 74" className={cn("w-10 h-10", className)} {...rest}>
      <path fill="url(#pattern0)" d="M0 0H74V74H0z" />
      <defs>
        <pattern
          id="pattern0"
          width="1"
          height="1"
          patternContentUnits="objectBoundingBox"
        >
          <use transform="scale(.005)" xlinkHref="#image0_1215_22578" />
        </pattern>
        <image
          id="image0_1215_22578"
          width="200"
          height="200"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export default LogoIcon;

export const FolderIcon = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 256 256"
      className={cn("w-10 h-10", className)}
      {...rest}
    >
      <g
        style={{
          stroke: 'none',
          strokeWidth: 0,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'none',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
      >
        <path
          d="M 73.538 35.162 l -52.548 1.952 c -1.739 0 -2.753 0.651 -3.232 2.323 L 6.85 76.754 c -0.451 1.586 -2.613 2.328 -4.117 2.328 h 0 C 1.23 79.082 0 77.852 0 76.349 l 0 -10.458 V 23.046 v -2.047 v -6.273 c 0 -2.103 1.705 -3.808 3.808 -3.808 h 27.056 c 1.01 0 1.978 0.401 2.692 1.115 l 7.85 7.85 c 0.714 0.714 1.683 1.115 2.692 1.115 H 69.73 c 2.103 0 3.808 1.705 3.808 3.808 v 1.301 C 73.538 26.106 73.538 35.162 73.538 35.162 z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            strokeDasharray: 'none',
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            fill: 'rgb(224,173,49)',
            fillRule: 'nonzero',
            opacity: 1,
          }}
          transform="matrix(1 0 0 1 0 0)"
          strokeLinecap="round"
        />
        <path
          d="M 2.733 79.082 L 2.733 79.082 c 1.503 0 2.282 -1.147 2.733 -2.733 l 10.996 -38.362 c 0.479 -1.672 2.008 -2.824 3.748 -2.824 h 67.379 c 1.609 0 2.765 1.546 2.311 3.09 L 79.004 75.279 c -0.492 1.751 -1.571 3.818 -3.803 3.803 C 75.201 79.082 2.733 79.082 2.733 79.082 z"
          style={{
            stroke: 'none',
            strokeWidth: 1,
            strokeDasharray: 'none',
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            fill: 'rgb(255,200,67)',
            fillRule: 'nonzero',
            opacity: 1,
          }}
          transform="matrix(1 0 0 1 0 0)"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}


export const FolderWithFilesIcon = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      id="folder"
      className={cn("w-6 h-6", className)}
      {...rest}
    >
      <path
        fill="#fdbf00"
        d="m18.57 15.51 7.86 7a2 2 0 0 0 1.33.51H56v34.9A2.93 2.93 0 0 1 53.26 61H5.74A2.93 2.93 0 0 1 3 57.92V18a2.85 2.85 0 0 1 2.68-3h11.56a2 2 0 0 1 1.33.51Z"
      />
      <path
        fill="#d7e6ef"
        d="M49 57H7V3h42z"
      />
      <path
        fill="#fdbf00"
        d="M45 23h16v-6a2 2 0 0 0-2-2h-6Z"
      />
      <path
        fill="#f7fcff"
        d="M14 9h42v14H14z"
      />
      <path
        fill="#ffda2d"
        d="m25.69 15.51 7.42 7a1.8 1.8 0 0 0 1.25.51H61v34.9A2.87 2.87 0 0 1 58.41 61H13.59A2.87 2.87 0 0 1 11 57.92V18a2.79 2.79 0 0 1 2.53-3h10.9a1.82 1.82 0 0 1 1.26.51Z"
      />
      <path
        fill="#f7fcff"
        d="M35 56H16v-4h19z"
      />
      <path
        fill="#d7e6ef"
        d="M32 15h20a1 1 0 0 0 0-2H32a1 1 0 0 0 0 2zm20 2H37a1 1 0 0 0 0 2h15a1 1 0 0 0 0-2z"
      />
      <path
        fill="#fdbf00"
        d="M56 27H46a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2zm0 4H41a1 1 0 0 0 0 2h15a1 1 0 0 0 0-2z"
      />
    </svg>
  );
}


export const DrawerIcon = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      className={cn("w-6 h-6", className)}
      {...rest}
    >
      <polygon
        fill="#E29F33"
        points="23.5 5.5 56.5 5.5 56.5 8.5 56.5 9.5 19.5 9.5 17.5 9.5 7.5 9.5 7.5 8.5 7.5 5.5 10.5 5.5 10.5 3.5 20.5 3.5"
      ></polygon>
      <polygon
        fill="#EDAB37"
        points="17.5 9.5 56.5 9.5 56.5 11.5 56.5 12.5 20.5 12.5 18.5 10.5"
      ></polygon>
      <polygon
        fill="#F6BB42"
        points="20.5 12.5 56.5 12.5 59.5 12.5 59.5 15.5 59.5 16.5 4.5 16.5 4.5 15.5 4.5 12.5 7.5 12.5 7.5 9.5 17.5 9.5 18.5 10.5"
      ></polygon>
      <path
        fill="#656D78"
        d="M63.5,22.5v36c0,1.1-0.9,2-2,2h-59c-1.1,0-2-0.9-2-2v-36c0-1.1,0.9-2,2-2h2h55h2
        C62.6,20.5,63.5,21.4,63.5,22.5z M44,43v-3c0-0.83-0.67-1.5-1.5-1.5S41,39.17,41,40v1.5H23V40c0-0.83-0.67-1.5-1.5-1.5
        S20,39.17,20,40v3c0,0.83,0.67,1.5,1.5,1.5H23h18h1.5C43.33,44.5,44,43.83,44,43z"
      ></path>
      <polygon
        fill="#FFCE54"
        points="59.5 19.5 59.5 20.5 4.5 20.5 4.5 19.5 4.5 16.5 59.5 16.5"
      ></polygon>
      <path
        fill="#CCD1D9"
        d="M44,40v3c0,0.83-0.67,1.5-1.5,1.5H41H23h-1.5c-0.83,0-1.5-0.67-1.5-1.5v-3c0-0.83,0.67-1.5,1.5-1.5
        S23,39.17,23,40v1.5h18V40c0-0.83,0.67-1.5,1.5-1.5S44,39.17,44,40z"
      ></path>
      <rect width="49" height="2" x="7.5" y="14.5" fill="#FFF"></rect>
      <rect width="43" height="2" x="10.5" y="7.5" fill="#E6E9ED"></rect>
      <path
        fill="#545C66"
        d="M3.499 56c-.276 0-.5-.224-.5-.5v-30c0-.276.224-.5.5-.5s.5.224.5.5v30C3.999 55.776 3.775 56 3.499 56zM60.501 56c-.276 0-.5-.224-.5-.5v-30c0-.276.224-.5.5-.5s.5.224.5.5v30C61.001 55.776 60.777 56 60.501 56z"
      ></path>
    </svg>
  );
}

export const FolderIcon2 = ({ className, ...rest }: IconProps & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsCc="http://creativecommons.org/ns#"
      xmlnsDc="http://purl.org/dc/elements/1.1/"
      xmlnsRdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      height="24"
      width="24"
      viewBox="0 0 24 24"
      className={cn("w-6 h-6", className)}
      {...rest}
    >
      <g transform="translate(0 -1028.4)">
        <path
          d="m12 1034.4c0 1.1-0.895 2-2 2h-5-3c-1.1046 0-2 0.9-2 2v8 3c0 1.1 0.89543 2 2 2h20c1.105 0 2-0.9 2-2v-3-10c0-1.1-0.895-2-2-2h-10z"
          fill="#D9E2DD"
        />
        <path
          d="m2 2c-1.1046 0-2 0.8954-2 2v5h10v1h14v-5c0-1.1046-0.895-2-2-2h-10.281c-0.346-0.5969-0.979-1-1.719-1h-8z"
          fill="#60A27C"
          transform="translate(0 1028.4)"
        />
        <path
          d="m12 1033.4c0 1.1-0.895 2-2 2h-5-3c-1.1046 0-2 0.9-2 2v8 3c0 1.1 0.89543 2 2 2h20c1.105 0 2-0.9 2-2v-3-10c0-1.1-0.895-2-2-2h-10z"
          fill="#8AC7A5"
        />
      </g>
    </svg>);
}
import Head from 'next/head';
import { useEffect } from 'react';
import Date from '../../../components/date';
import Layout from '../../../components/layout';
import { getPathPost, getPostData } from '../../../lib/posts';
import utilStyles from '../../../styles/utils.module.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';



export default function Post({ postData }) {

    useEffect(() => {
        document.querySelectorAll('code').forEach(el => {
            hljs.highlightElement(el);
        });
    }, []);

    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                    <Date dateString={postData.date} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
        </Layout>
    );
}

// export async function getStaticPaths() {
//     const paths = getAllPostIds();
//     return {
//         paths,
//         fallback: false,
//     };
// }

export async function getStaticPaths() {
    const paths = getPathPost();
    return {
        paths,
        fallback: false,
    };
}


export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id, params.category);
    return {
        props: {
            postData,
        },
    };
}
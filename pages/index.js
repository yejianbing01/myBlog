import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';
import utilStyles from '../styles/utils.module.css';
import { getAllCategory } from '../lib/posts';


// Only Allowed in a Page
export async function getStaticProps() {
  const allCategory = getAllCategory();
  return {
    props: {
      allCategory,
    },
  };
}

export default function Home({ allCategory }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover" />
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allCategory.map((category) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${category}`}>{category}</Link>
              {/* <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small> */}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
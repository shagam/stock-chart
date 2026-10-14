<CodeBlock language="jsx" editable>
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";

const seoByPath = { "/": { title: "ShareCompare - Compare ETFs and Stocks", description: "Compare ETF holdings, analyze historical market drops, and explore investment recovery scenarios." },

"/dropCount": { title: "ETF Drop Analysis - ShareCompare", description: "Analyze stock and ETF price declines and explore historical market drop patterns." },

"/dropRecovery": { title: "Market Drop Recovery - ShareCompare", description: "Compare historical market crashes and recovery periods to better understand investment risks." },

// Add your other routes here. };

const defaultSeo = { title: "ShareCompare", description: "Tools for comparing ETFs, stocks, market drops, and investment scenarios." };

export default function RouteSeo() { const { pathname } = useLocation();

const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";

const seo = seoByPath[path] || defaultSeo;

return ( <Helmet> <title>{seo.title}</title> <meta name="description" content={seo.description} /> </Helmet> ); }

</CodeBlock>
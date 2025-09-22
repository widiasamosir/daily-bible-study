import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET() {
    try {
        const response = await notion.databases.query({
            database_id: process.env.NOTION_DATABASE_ID,
            sorts: [{ property: "Chapter", direction: "descending" }]
        });


        return NextResponse.json({ results: response.results });
    } catch (error) {
        console.error("❌ Error fetching Notion data:");
        console.error(error); // logs full trace with stack + details

        return NextResponse.json(
            {
                message: "Error fetching devotion",
                error: error.message,
                stack: error.stack,
            },
            { status: 500 }
        );
    }
}

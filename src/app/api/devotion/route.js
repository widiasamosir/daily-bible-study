import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function GET() {
    try {
        let allResults = [];
        let cursor = undefined;

        do {
            const response = await notion.databases.query({
                database_id: process.env.NOTION_DATABASE_ID,
                sorts: [{ property: "Chapter", direction: "descending" }],
                page_size: 100,                 // max allowed
                start_cursor: cursor || undefined,
            });

            allResults.push(...response.results);
            cursor = response.next_cursor;
        } while (cursor);

        return NextResponse.json({ results: allResults });

    } catch (error) {
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
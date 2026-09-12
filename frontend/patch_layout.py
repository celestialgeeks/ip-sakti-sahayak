import re

with open("src/app/layout.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { Sidebar } from "@/components/layout/Sidebar";',
    'import { Sidebar } from "@/components/layout/Sidebar";\nimport { ApiKeyDialog } from "@/components/ApiKeyDialog";'
)

content = content.replace(
    '{children}',
    '{children}\n            <ApiKeyDialog />'
)

with open("src/app/layout.tsx", "w") as f:
    f.write(content)

import os
import re

def convert_match(match):
    full_tag = match.group(0)
    
    # Check if it's a figure or just an img
    if full_tag.startswith('<figure'):
        # Extract figcaption
        caption_match = re.search(r'<figcaption>(.*?)</figcaption>', full_tag, re.DOTALL)
        caption = caption_match.group(1).strip() if caption_match else None
        
        # Find all images in the figure (for galleries)
        img_tags = re.findall(r'<img.*?>', full_tag, re.DOTALL)
        
        md_images = []
        for img_tag in img_tags:
            src_match = re.search(r'src="(/src/assets/.*?)"', img_tag)
            alt_match = re.search(r'alt="(.*?)"', img_tag)
            
            if not src_match:
                # Might have alt without quotes or other variations, but the rule says 'alt' attribute
                # Simple search for now
                continue
                
            src = src_match.group(1).replace('/src/assets/', '../../assets/')
            
            # Alt text logic:
            # 1. Figcaption
            # 2. alt attribute
            # 3. empty
            alt = ""
            if caption:
                alt = caption
            elif alt_match:
                alt = alt_match.group(1)
            
            md_images.append(f"![{alt}]({src})")
            
        return "\n".join(md_images)
    else:
        # Just an img tag
        src_match = re.search(r'src="(/src/assets/.*?)"', full_tag)
        alt_match = re.search(r'alt="(.*?)"', full_tag)
        
        if not src_match:
            return full_tag
            
        src = src_match.group(1).replace('/src/assets/', '../../assets/')
        alt = alt_match.group(1) if alt_match else ""
        
        return f"![{alt}]({src})"

files = [
    "src/content/blog/saturday-blueprint-on-flow.md",
    "src/content/blog/on-the-cold.md",
    "src/content/blog/saturday-blueprint-on-why-i-write.md",
    "src/content/blog/saturday-blueprint-on-habits-and-routines.md",
    "src/content/blog/saturday-blueprint-on-summer.md",
    "src/content/blog/saturday-blueprint-on-infirmity.md",
    "src/content/blog/saturday-blueprint-on-character.md",
    "src/content/blog/saturday-blueprint-on-the-principal-agent-problem.md",
    "src/content/blog/behave-like-a-jedi-and-embrace-the-present-moment.md",
    "src/content/blog/saturday-blueprint-on-learning-from-children.md",
    "src/content/blog/saturday-blueprint-on-keto.md",
    "src/content/blog/saturday-blueprint-on-dartmoor.md",
    "src/content/blog/an-essay-on-dartmoor.md",
    "src/content/blog/saturday-blueprint-on-stress-sick.md",
    "src/content/blog/surprising-lessons-i-learnt-from-running-a-20-mile-race-in-sandals.md",
    "src/content/blog/saturday-blueprint-on-press-ups-and-stress.md",
    "src/content/blog/saturday-blueprint-on-coffee-and-steak.md",
    "src/content/blog/saturday-blueprint-on-adventure.md",
    "src/content/blog/saturday-blueprint-on-the-two-best-homemade-health-foods.md",
    "src/content/blog/saturday-blueprint-on-writing-your-story.md",
    "src/content/blog/saturday-blueprint-on-the-monthly-review.md",
    "src/content/blog/saturday-blueprint-on-contrast-and-dichotomy.md",
    "src/content/blog/100-days-of-haiku.md",
    "src/content/blog/saturday-blueprint-on-the-sidmouth-saunter.md",
    "src/content/blog/saturday-blueprint-on-turning-40.md",
    "src/content/blog/saturday-blueprint-on-suffering.md",
    "src/content/blog/saturday-blueprint-on-great-books.md",
    "src/content/blog/saturday-blueprint-on-the-seasons.md",
    "src/content/blog/saturday-blueprint-on-creativity.md",
    "src/content/blog/saturday-blueprint-on-the-power-of-the-mind.md",
    "src/content/blog/saturday-blueprint-on-directives.md",
    "src/content/blog/saturday-blueprint-on-researching-and-learning.md",
    "src/content/blog/the-burning-monk.md",
    "src/content/blog/saturday-blueprint-on-injury.md",
    "src/content/blog/saturday-blueprint-on-parenting.md"
]

figure_pattern = re.compile(r'<figure.*?>.*?</figure>', re.DOTALL)
img_pattern = re.compile(r'<img.*?>', re.DOTALL)

for file_path in files:
    full_path = os.path.join(os.getcwd(), file_path)
    if not os.path.exists(full_path):
        print(f"Skipping {file_path}, not found.")
        continue
        
    with open(full_path, 'r') as f:
        content = f.read()
    
    def figure_replacer(match):
        if '/src/assets' in match.group(0):
            return convert_match(match)
        return match.group(0)
    
    new_content = figure_pattern.sub(figure_replacer, content)
    
    def img_replacer(match):
        if '/src/assets' in match.group(0):
            return convert_match(match)
        return match.group(0)
    
    new_content = img_pattern.sub(img_replacer, new_content)
    
    if new_content != content:
        with open(full_path, 'w') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes for {file_path}")

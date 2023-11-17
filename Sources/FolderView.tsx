﻿import React, {useMemo, useState} from "react";
import {App} from "obsidian";

interface FolderTreeData {
	id: string;
	name: string;
	isFile: boolean;
	children: FolderTreeData[];
}

function NavFile({folderTreeData}: { folderTreeData: FolderTreeData }) {
	return (
		<>
			<div className={"tree-item-self is-clickable nav-file-title"}>
				<div className={"tree-item-inner nav-file-title-content"}>{folderTreeData.name}</div>
			</div>
		</>
	) 
}

function NavFolder({folderTreeData}: { folderTreeData: FolderTreeData }) {
	const [showChildren, setShowChildren] = useState(true);

	const handleClick = () => {
		setShowChildren(!showChildren);
	};
	
	return (
		<>
			<div className={"tree-item-self is-clickable mod-collapsible nav-folder-title"} draggable={"true"}
				 onClick={handleClick}>
				<div className={"tree-item-inner nav-folder-title-content"}>
					{folderTreeData.name}
				</div>
			</div>
			<div className={"tree-item-children nav-folder-children"}>
				{showChildren && <NavTreeView folderTreeDatas={folderTreeData.children}/>}
			</div>
		</>
	)
}

function NavTreeView({folderTreeDatas}: { folderTreeDatas: FolderTreeData[] }) {
	const folders = folderTreeDatas.filter(x => !x.isFile);
	const files = folderTreeDatas.filter(x => x.isFile);
	
	return (
		<>
			<div className={"tree-item nav-folder"}>
				{folders.map((node) => (
					<NavFolder folderTreeData={node}/>
				))}
			</div>
			<div className={"tree-item nav-file"}>
				{files.map((node) => (
					<NavFile folderTreeData={node}/>
				))}
			</div>
		</>
	);
}

export function FolderView({app}: { app: App }) {
	let folderTreeData: FolderTreeData = {
		id: "root",
		name: app.vault.getName(),
		isFile: false,
		children: [
			{
				id: "project",
				name: "Project",
				isFile: false,
				children: []
			},
			{
				id: "area",
				name: "Area",
				isFile: false,
				children: []
			},
			{
				id: "resource",
				name: "Resource",
				isFile: false,
				children: []
			},
			{
				id: "archive",
				name: "Archive",
				isFile: false,
				children: []
			}
		]
	}

	// Populate folderTree.
	// TODO: Deal with other files like Excalidraw
	const files = this.app.vault.getMarkdownFiles();
	let fileNames: string[] = [];

	// TODO: Sort by name
	for (let i = 0; i < files.length; i++) {
		let paraProperty: string | null = null;

		fileNames[i] = files[i].basename;
		let frontMatter = this.app.metadataCache.getFileCache(files[i])?.frontmatter;
		if (frontMatter) {
			paraProperty = frontMatter["PARA"];
		}
		if (paraProperty) {
			// Add folder structure.
			let folderStructure: string[] = paraProperty.split("/");
			switch (folderStructure[0]) {
				case "Project":
					let currentData = folderTreeData.children[0];
					for (let i = 1; i < folderStructure.length; i++) {
						let data = currentData.children.find(x => x.name == folderStructure[i]);
						if (!data) {
							data = {
								id: currentData.children.length.toString(),
								name: folderStructure[i],
								isFile: false,
								children: []
							}
							currentData.children.push(data);
						}
						currentData = data;
					}
					break;
				case "Area":
					break;
				case "Resource":
					break;
				case "Archive":
					break;

			}
		}
	}

	console.log(folderTreeData);

	return (
		<>
			<div className={"tree-item nav-folder mod-root"}>
				<div className={"tree-item-self nav-folder-title"}>
					<div className={"tree-item-inner nav-folder-title-content"}>
						{folderTreeData.name}
					</div>
				</div>
				<div className={"tree-item-children nav-folder-children"}
					// style={{width: "305px", height: "0.1px", marginBottom: "0px"}}>
				>
					<NavTreeView folderTreeDatas={folderTreeData.children}/>
				</div>
			</div>
		</>
	);
}

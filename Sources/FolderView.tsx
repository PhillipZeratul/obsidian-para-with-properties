﻿import {App, TFile} from "obsidian";
import React, {useState, useId} from "react";
import {useSpring, animated} from "@react-spring/web";
import useMeasure from 'react-use-measure'
import {useRecoilState} from 'recoil';
import * as RecoilState from 'Sources/Recoil/RecoilState';
import {DragDropContext, Draggable, Droppable, DropResult} from '@hello-pangea/dnd';
import {NavTreeData} from "./NavTreeData";

export function FolderView({navTreeData}: { navTreeData: NavTreeData }) {
	function findChildById(data: NavTreeData, id: string): NavTreeData | undefined {
		if (data.id === id) {
			return data;
		}
		for (const child of data.children) {
			const foundChild = findChildById(child, id);
			if (foundChild) {
				return foundChild;
			}
		}
		return undefined;
	}

	function onDragEnd(result: DropResult) {
		// dropped outside the list
		if (!result.destination) {
			return;
		}

		let dragData = findChildById(navTreeData, result.draggableId);
		let dropData = findChildById(navTreeData, result.destination.droppableId);
		console.log("onDragEnd: from: " + dragData?.name + " to: " + dropData?.name);
	}

	return (
		<div className={"tree-item nav-folder mod-root"}>
			<div className={"tree-item-self nav-folder-title"}>
				<div className={"tree-item-inner nav-folder-title-content"}>
					{navTreeData.name}
				</div>
			</div>
			<DragDropContext onDragEnd={onDragEnd}>
				<NavTree navTreeDatas={navTreeData.children} app={app}/>
			</DragDropContext>
		</div>
	);
}

function NavTree({navTreeDatas, app}: { navTreeDatas: NavTreeData[], app: App }) {
	const folderDatas = navTreeDatas.filter(x => !x.isFile);
	const fileDatas = navTreeDatas.filter(x => x.isFile);

	return (
		<div className={"tree-item-children nav-folder-children"}>
			<div style={{height: "0.1px", marginBottom: "0px"}}/>
			{folderDatas.map((node, index) => (
				<NavFolder folderData={node} key={node.id} app={app} index={index}/>
			))}
			{fileDatas.map((node, index) => (
				<NavFile fileData={node} key={node.id} app={app} index={index}/>
			))}
		</div>
	);
}

function NavFolder({folderData, app, index}: { folderData: NavTreeData, app: App, index: number }) {
	const [isOpen, setIsOpen] = useState(true);
	const [measureRef, {height: viewHeight}] = useMeasure()
	const {height} = useSpring({
		from: {height: 0},
		to: {
			height: isOpen ? viewHeight : 0
		},
		config: {
			duration: 100
		}
	})
	// TODO: Use previous isOpen state to simplify the animation. 

	const handleClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<Droppable droppableId={folderData.id}>
			{(provided, snapshot) => (
				<div className={"tree-item nav-folder" +
					(isOpen ? "" : " is-collapsed") +
					(snapshot.isDraggingOver ? " is-being-dragged-over" : "")}>
					<div className={"tree-item-self is-clickable mod-collapsible nav-folder-title"}
						 onClick={handleClick}
						 ref={provided.innerRef}
						 {...provided.droppableProps}>
						<div className={"tree-item-icon collapse-icon nav-folder-collapse-indicator" +
							(isOpen ? "" : " is-collapsed")}>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
								 fill="none"
								 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
								 className="svg-icon right-triangle">
								<path d="M3 8L12 17L21 8"></path>
							</svg>
						</div>
						<div className={"tree-item-inner nav-folder-title-content"}>
							{folderData.name}
						</div>
					</div>
					<animated.div style={{height: height, overflow: snapshot.isDraggingOver ? "visible" : "hidden"}}>
						<div ref={measureRef}>
							{isOpen && <NavTree navTreeDatas={folderData.children} app={app}/>}
						</div>
					</animated.div>
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	)
}

function NavFile({fileData, app, index}: { fileData: NavTreeData, app: App, index: number }) {
	const [activeFile, setActiveFile] = useRecoilState(RecoilState.activeFile);

	let file = fileData.file as TFile;

	// TODO: Multi-select support. Shift click & Alt click.
	const openFile = (e: React.MouseEvent) => {
		if (file !== undefined) {
			let newLeaf = (e.ctrlKey || e.metaKey) && !(e.shiftKey || e.altKey);
			let leafBySplit = (e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey);

			let leaf = app.workspace.getLeaf(newLeaf);
			if (leafBySplit) leaf = app.workspace.createLeafBySplit(leaf, "vertical");
			app.workspace.setActiveLeaf(leaf);
			leaf.openFile(file, {eState: {focus: true}}).then(r => setActiveFile(file));
		}
	};

	return (
		<Draggable draggableId={fileData.id} index={index} key={useId()}>
			{(provided, snapshot) => (
				<div ref={provided.innerRef}
					 {...provided.draggableProps}
					 {...provided.dragHandleProps}>
					<div className={"tree-item nav-file"}>
						<div className={"tree-item-self is-clickable nav-file-title" +
							(activeFile === file ? " is-active" : "")}
							 onClick={(e) => openFile(e)}>
							<div className={"tree-item-inner nav-file-title-content"}>{fileData.name}</div>
						</div>
					</div>
				</div>
			)}
		</Draggable>
	)
}

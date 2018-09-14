package jk.kamoru.flayground.info.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jk.kamoru.flayground.flay.domain.Flay;
import jk.kamoru.flayground.info.domain.History;
import jk.kamoru.flayground.info.domain.History.Action;
import jk.kamoru.flayground.info.source.HistoryRepository;

@Service
public class HistoryServiceImpl implements HistoryService {

	@Autowired HistoryRepository historyRepository;
	
	@Override
	public List<History> find(String query) {
		return historyRepository.list().stream().filter(h -> h.toFileSaveString().contains(query)).collect(Collectors.toList());
	}

	@Override
	public void persist(History history) {
		historyRepository.create(history);
	}

	@Override
	public void save(Action play, Flay flay) {
		persist(new History(play, flay.getOpus(), flay.getFullname()));
	}

}

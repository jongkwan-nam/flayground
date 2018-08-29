package jk.kamoru.flayground.flay.source;

import java.util.Collection;

import jk.kamoru.flayground.flay.domain.Flay;

public interface FlaySource {

	void load();
	
	Collection<Flay> getList();
	
	Flay get(String key);

}

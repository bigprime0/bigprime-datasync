package com.bigprime.datasync.backend.service.sys;

import com.bigprime.datasync.core.exception.ServerException;
import com.bigprime.datasync.core.handler.MenuCoreHandler;
import com.bigprime.datasync.core.model.SysMenuVO;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.core.model.user.SysMenuModel;
import com.bigprime.datasync.core.utils.DozerUtils;
import com.bigprime.datasync.backend.handler.sys.SysRoleMenuHandler;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 菜单管理业务类
 *
 * @author lyw
 * @version 1.0
 */
@Service
@AllArgsConstructor
public class SysMenuService {

    private final MenuCoreHandler modelHandler;
    private final SysRoleMenuHandler sysRoleMenuHandler;

    /**
     * 菜单导航
     *
     * @param user
     * @return
     */
    public List<SysMenuVO> getUserMenuList(UserDetail user, Integer type) {
        return modelHandler.getUserMenuList(user, type);
    }

    /**
     * 查找所有父级信息
     *
     * @param allMaps
     * @param userMaps
     * @param model
     */
    public void getParent(Map<Long, SysMenuModel> allMaps, Map<Long, SysMenuModel> userMaps, SysMenuModel model) {
        if (!userMaps.containsKey(model.id)) {
            userMaps.put(model.id, model);
        }
        if (model.getPid() > 0 && allMaps.containsKey(model.getPid())) {
            getParent(allMaps, userMaps, allMaps.get(model.getPid()));
        }
    }


    /**
     * 保存数据
     *
     * @param vo
     * @return
     */
    public long save(SysMenuVO vo) {
        vo.setType(3);
        return modelHandler.save(DozerUtils.map(vo, SysMenuModel.class));
    }

    /**
     * 更新数据
     *
     * @param vo
     * @return
     */
    public long update(SysMenuVO vo) {
        // 上级菜单不能为自己
        if (vo.getId().equals(vo.getPid())) {
            throw new ServerException("上级菜单不能为自己");
        }
        return modelHandler.update(DozerUtils.map(vo, SysMenuModel.class));
    }

    /**
     * 根据ID删除
     *
     * @param id
     * @return
     */
    public long delete(Long id) {
        Long count = modelHandler.getCountByPid(id);
        if (count > 0) {
            throw new ServerException("请先删除子菜单");
        }
        //删除菜单
        modelHandler.delete(id);
        //删除菜单角色
        return sysRoleMenuHandler.deleteByMenuId(id);
    }
}
